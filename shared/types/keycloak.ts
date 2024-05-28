export type KeycloakToken = {
  sub: string,
  exp: number,
  email: string,
  preferred_username: string,
  given_name: string,
  family_name: string,
  realm_access: {
    roles: string[]
  }
}