import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ResendOtpDto {
    @IsEmail()
    email: string;

    @IsString()
    purpose: string;

    @IsOptional()
    @IsString()
    password?: string;
}
