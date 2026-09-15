import { IsNotEmpty, IsString, IsCreditCard, Matches } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Card number is required' })
  cardNumber: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Expiry date must be in MM/YY format' })
  expiry: string;

  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'CVC must be 3 or 4 digits' })
  cvc: string;

  @IsString()
  @IsNotEmpty({ message: 'Idempotency key is required' })
  idempotencyKey: string;
}
