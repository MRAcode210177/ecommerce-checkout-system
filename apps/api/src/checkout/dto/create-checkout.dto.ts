import { IsArray, ValidateNested, ArrayMinSize, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CheckoutItemDto } from './checkout-item.dto';

export class CreateCheckoutDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Checkout must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
