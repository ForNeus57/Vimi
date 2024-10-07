export class RegistrationErrors {
  public constructor(
    public username: string[] | undefined,
    public first_name: string[] | undefined,
    public last_name: string[] | undefined,
    public email: string[] | undefined,
    public password: string[] | undefined,
    public password_confirm: string[] | undefined,
  ) {
  }
}