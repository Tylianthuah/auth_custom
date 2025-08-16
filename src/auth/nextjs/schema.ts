export type SignUpSchema =  {
    name : string;
    email: string;
    password : string
}

export type SignInSchema =  {
    email: string;
    password : string
}


export interface TokenResponse {
  access_token: string;
  token_type: string;
}


export interface GithubUserSchema {
    name: string,
    email : string,
    id : string
}