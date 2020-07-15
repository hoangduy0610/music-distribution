require('dotenv').config();

export class Constant {
    public static getEnv(name: string) {
        switch (name) {
            case 'URL_OAUTH_API_REGISTER':
                return process.env.OAUTH + '/api/signup';

            case 'URL_OAUTH_API_AUTH':
                return process.env.OAUTH + '/api/signin';

            case 'URL_OAUTH_API_CHECK_TOKEN':
                return process.env.OAUTH + '/api/token';

            default:
                break;
        }
    }
    public static readonly JWT_SECRET = 'RHV5RGVwVHJhaToxMjM0';
}
