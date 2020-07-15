import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Constant } from '../commons/Constant';
import axios from 'axios';
import { ApplicationException } from "../controllers/ExceptionController";
import { MessageCode } from "../commons/MessageCode";
import fetch from 'node-fetch';

@Injectable()
export class OAuthService {

    async register(username: string, password: string): Promise<any> {
        const postData = JSON.stringify({ username, password });
        return await fetch(Constant.getEnv('URL_OAUTH_API_REGISTER'), {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: postData,
        });
    }

    async check_token(access_token: string) {
        const config = {
            params: {
                token: access_token
            },
            headers: {
                Authorization: process.env.AUTH_KEY_OAUTH
            }
        };
        Logger.log(JSON.stringify(config));
        try {
            const response = await axios.get(Constant.getEnv('URL_OAUTH_API_CHECK_TOKEN'), config);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status) {
                Logger.error('[ERROR] - Got ' + (error.response.status || 'null') + ' from OAuth with message: ' +
                    (error.response.data && (error.response.data.message || error.response.data.error_description) || error.message), null, null, true);
                if (error.response.status === 400) {
                    throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.ERROR_USER_OAUTH_AUTH);
                }
                if (error.response.status === 502 || error.response.status === 504 || error.response.status === 500) {
                    throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.A_SERVICE_UNAVAILABLE);
                }
            }
            Logger.error('[ERROR] - ' + error.message, null, null, true);
            throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.A_SERVICE_UNAVAILABLE);
        }
    }


    async auth(username: string, password: string): Promise<any> {
        const config = {
            headers: {
                Authorization: process.env.AUTH_KEY_OAUTH
            },
            /*params: {
                grant_type: 'password',
                username, password
            }*/
        };
        try {
            const response = await axios.post(Constant.getEnv('URL_OAUTH_API_AUTH'), { username, password }, config);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status) {
                Logger.error('[ERROR] - Got ' + (error.response.status || 'null') + ' from OAuth with message: ' +
                    (error.response.data && (error.response.data.message || error.response.data.error_description) || error.message), null, null, true);
                if (error.response.status === 401) {
                    throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.ERROR_USER_OAUTH_AUTH);
                }
                if (error.response.status === 502 || error.response.status === 504 || error.response.status === 500) {
                    throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.A_SERVICE_UNAVAILABLE);
                }
            }
            Logger.error('[ERROR] - ' + error.message, null, null, true);
            throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.A_SERVICE_UNAVAILABLE);
        }
    }
}
