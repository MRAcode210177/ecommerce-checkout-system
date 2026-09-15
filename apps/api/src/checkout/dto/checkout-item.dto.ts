import { IsNotEmpty, IsString, IsInt, IsPositive } from 'class-validator';

export class CheckoutItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @IsInt({ message: 'Quantity must be an integer' })
  @IsPositive({ message: 'Quantity must be a positive integer greater than zero' })
  quantity: number;
}
