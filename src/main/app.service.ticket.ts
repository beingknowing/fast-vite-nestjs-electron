import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as qs from "qs";

import type { AxiosRequestConfig } from "axios";
import {
  ClientCredential,
  TicketResponse,
  TicketType,
} from "@/types/orm_types";
import { AppServiceOS } from "./app.service.os";
import { AppServiceStore } from "./app.service.store";

@Injectable()
export class AppServiceTicket {
  public constructor(
    private readonly appServiceOS: AppServiceOS,
    private readonly store: AppServiceStore,
  ) {
    axios.defaults.timeout = 60000;
  }
  public async getCurrent() {
    const current = await this.store.getCurrent();
    return current;
  }
  public async getToken() {
    return this.getCurrent().then(async (current) => {
      const data = qs.stringify({
        grant_type: "client_credentials",
        client_secret: current.client_secret,
        client_id: current.client_id,
      });
      const config = {
        method: "post",
        url: `${current.sn_host}/oauth_token.do`,
        headers: {
          "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
          Accept: "*/*",
          Connection: "keep-alive",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      } satisfies AxiosRequestConfig;

      return await axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          return response.data as ClientCredential;
        })
        .catch(function (error) {
          console.log(error);
          throw new Error(error);
        });
    });
  }

  public async submitTicket(userInput: TicketType) {
    console.log("🚀 ~ AppServiceTicket ~ submitTicket ~ userInput:", userInput);
    const client_credentials = await this.getToken();
    const data = JSON.stringify({
      u_caller_id: this.appServiceOS.getUserName(),
      u_pfe_requested_by: userInput.userName,
      u_short_description: userInput.title,
      u_assignment_group: userInput.queue_val,
      u_description: userInput.content,
      u_impact: "2",
      u_urgency: "2",
      u_contact_type: "internal",
      u_comments: "Ticket raised",
      u_correlation_id: "",
      u_correlation_display: "",
      u_use_ci_alert_assignment: 1,
    });
    // console.log("🚀 ~ AppServiceTicket ~ submitTicket ~ data:", data);
    return await this.getCurrent().then(async (current) => {
      const config = {
        method: "post",
        url: `${current.sn_host}/api/now/import/u_create_incident_inbound`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${client_credentials.access_token}`,
          Accept: "*/*",
          Connection: "keep-alive",
        },
        data: data,
      };

      return await axios(config)
        .then((response) => {
          console.log(
            "🚀 ~ AppServiceTicket ~ submitTicket ~ response:",
            response.data,
          );
          const res = response.data as TicketResponse;
          if (res?.result) {
            for (const result of res.result) {
              result.ticket_link = `${current.sn_host}/now/sow/record/incident/${result.sys_id}`;
              result.createTime = new Date().toLocaleString();
              this.store.saveTicketHistory(result);
            }
          }

          return res;
        })
        .catch(function (error) {
          console.log(error);
          throw new Error(error);
        });
    });
  }
}
