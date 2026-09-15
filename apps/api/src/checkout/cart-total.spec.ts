describe('Cart Total Calculation Logic', () => {
  const calculateCartTotal = (items: { price: number; quantity: number }[], discountPercent = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount;
    return Math.round(total * 100) / 100;
  };

  it('should correctly calculate total for a single item', () => {
    const items = [{ price: 299.99, quantity: 2 }];
    expect(calculateCartTotal(items)).toBe(599.98);
  });

  it('should correctly aggregate total for multiple distinct items', () => {
    const items = [
      { price: 299.99, quantity: 1 },
      { price: 129.5, quantity: 2 },
      { price: 34.99, quantity: 3 },
    ];
    // 299.99 + 259.00 + 104.97 = 663.96
    expect(calculateCartTotal(items)).toBe(663.96);
  });

  it('should apply discount percentage correctly with 2 decimal precision rounding', () => {
    const items = [{ price: 100, quantity: 3 }];
    expect(calculateCartTotal(items, 15)).toBe(255.0);
  });

  it('should handle fractional price arithmetic without IEEE-754 precision errors', () => {
    const items = [
      { price: 19.99, quantity: 3 }, // 59.97
      { price: 5.49, quantity: 7 },  // 38.43
    ];
    // 59.97 + 38.43 = 98.40
    expect(calculateCartTotal(items)).toBe(98.4);
  });
});
