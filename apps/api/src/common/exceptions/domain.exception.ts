import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode: status,
        code,
        message,
      },
      status,
    );
  }
}

export class InsufficientStockException extends DomainException {
  constructor(productId: string, productName?: string, requested?: number, available?: number) {
    const detail = productName
      ? `Insufficient stock for product '${productName}' (ID: ${productId}). Requested: ${requested}, Available: ${available}`
      : `Insufficient stock for product ID: ${productId}`;
    super('INSUFFICIENT_STOCK', detail, HttpStatus.CONFLICT);
  }
}

export class InvalidStateTransitionException extends DomainException {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      'INVALID_STATE_TRANSITION',
      `Cannot transition order status from '${currentStatus}' to '${targetStatus}'.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string, id: string) {
    super('RESOURCE_NOT_FOUND', `${resource} with ID '${id}' was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class ForbiddenResourceException extends DomainException {
  constructor(message = 'You do not have permission to access or modify this resource.') {
    super('FORBIDDEN_RESOURCE', message, HttpStatus.FORBIDDEN);
  }
}

export class PaymentDeclinedException extends DomainException {
  constructor(reason = 'Payment transaction was declined by issuing bank.') {
    super('PAYMENT_DECLINED', reason, HttpStatus.BAD_REQUEST);
  }
}

export class DuplicateTransactionException extends DomainException {
  constructor(idempotencyKey: string) {
    super('DUPLICATE_TRANSACTION', `Transaction with idempotency key '${idempotencyKey}' has already been processed.`, HttpStatus.CONFLICT);
  }
}
