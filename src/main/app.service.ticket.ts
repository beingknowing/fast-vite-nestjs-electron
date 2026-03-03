import { Injectable } from '@nestjs/common'
import axios from 'axios';
import * as qs from 'qs';

import type { AxiosRequestConfig } from 'axios';
import { ClientCredential, TicketResponse, TicketType } from '../../types/orm_types';
import { AppServiceOS } from './app.service.os';

@Injectable()
export class AppServiceTicket {
    public constructor(private readonly appServiceOS: AppServiceOS) {
        axios.defaults.timeout = 60000;
    }
    public async getToken() {
        var data = qs.stringify({
            'grant_type': 'client_credentials',
            'client_secret': process.env.client_secret,
            'client_id': process.env.client_id
        });
        var config = {
            method: 'post',
            url: `${process.env.sn_host}/oauth_token.do`,
            headers: {
                'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
                'Accept': '*/*',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: data
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
    }

    public async submitTicket(userInput: TicketType) {

        let client_credentials = await this.getToken()
        var data = JSON.stringify({
            "u_caller_id": this.appServiceOS.getUserName(),
            "u_pfe_requested_by": userInput.userName,
            "u_short_description": userInput.title,
            "u_assignment_group": userInput.queue_val,
            "u_description": userInput.content,
            "u_impact": "2",
            "u_urgency": "2",
            "u_contact_type": "internal",
            "u_comments": "Ticket raised",
            "u_correlation_id": "",
            "u_correlation_display": "",
            "u_use_ci_alert_assignment": 1
        });

        var config = {
            method: 'post',
            url: `${process.env.sn_host}/api/now/import/u_create_incident_inbound`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${client_credentials.access_token}`,
                'Accept': '*/*',
                'Connection': 'keep-alive',
            },
            data: data
        };

        return await axios(config)
            .then(function (response) {
                return response.data as TicketResponse
            })
            .catch(function (error) {
                console.log(error);
                throw new Error(error);
            });

    }
}
