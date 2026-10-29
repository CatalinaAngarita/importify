import { IsEmail } from 'class-validator';

export class SendOtpDto {
  @IsEmail({}, { message: 'Correo inválido' })
  email!: string;
}
