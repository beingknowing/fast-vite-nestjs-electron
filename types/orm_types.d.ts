export interface TicketType {
  title: string;
  content: string;
  queue_val: string;
  userName?: string;
}

export interface ClientCredential {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface TicketResponse {
  import_set: string; //"ISET0293839",
  staging_table: string; // "u_create_incident_inbound",
  result: TicketResult[];
}
export interface TicketResult {
  transform_map: string; //"PFE_Create_Incident_inbound",
  table: string; // "incident",
  display_name: string; // "number",
  display_value: string; // "INC02530827",
  record_link: string; // "https://pfetst.service-now.com/api/now/table/incident/15aff0c01bbaf21076c00dc5604bcb9e",
  status: string; //"inserted",
  sys_id: string; // "15aff0c01bbaf21076c00dc5604bcb9e"
  ticket_link: string; //   `${current.sn_host}/now/sow/record/incident/${result.value.result[0].sys_id}`
  createTime?: string; // "2024-06-17 10:20:30"
}
export interface CredentialItem {
  isCurrent?: boolean;
  client_secret?: string;
  client_id?: string;
  sn_host?: string;
  editing?: boolean;
}

export interface CredentialState {
  tableData: CredentialItem[];
  // currentKey: CredentialItem['sn_host'] | undefined;
}
