import * as os from 'os';

import { Injectable } from '@nestjs/common'

@Injectable()
export class AppServiceOS {
    public getUserName() {
        const username = process.env.USERNAME || os.userInfo().username;
        return username;
    }
}
