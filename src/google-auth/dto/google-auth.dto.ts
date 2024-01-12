import { IsNotEmpty } from 'class-validator';

export class GoogleAuthDto {
  @IsNotEmpty()
  idToken: string;
}
