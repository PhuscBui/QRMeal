export interface CreateAccountReqBody {
  name: string
  email: string
  role: string
  owner_id: string
  password: string
  confirm_password: string
  date_of_birth: string
}
