export class Registration {
  public constructor(
    public username: string,
    public first_name: string,
    public last_name: string,
    public email: string,
    public password: string,
    public confirm_password: string,
  ) {}
}