import { IsNotEmpty, IsNumber, IsString, IsInt, Min, IsUrl, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Product description is required' })
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @IsInt()
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsUrl({}, { message: 'Invalid image URL' })
  @IsNotEmpty({ message: 'Image URL is required' })
  imageUrl: string;
}
