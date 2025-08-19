-- Insert sample products
INSERT INTO products (name, company, purchase_price, sale_price) VALUES
('Laptop Dell Inspiron 15', 'Dell', 450.00, 650.00),
('Mouse Logitech MX Master', 'Logitech', 35.00, 55.00),
('Teclado Mecánico Corsair', 'Corsair', 80.00, 120.00),
('Monitor Samsung 24"', 'Samsung', 180.00, 280.00),
('Auriculares Sony WH-1000XM4', 'Sony', 200.00, 320.00),
('Webcam Logitech C920', 'Logitech', 60.00, 95.00),
('SSD Kingston 1TB', 'Kingston', 85.00, 130.00),
('RAM Corsair 16GB DDR4', 'Corsair', 70.00, 110.00),
('Impresora HP LaserJet', 'HP', 150.00, 230.00),
('Router TP-Link AC1750', 'TP-Link', 45.00, 75.00)
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO orders (order_number, customer_name, customer_email, status) VALUES
('ORD-2024-001', 'Juan Pérez', 'juan.perez@email.com', 'completed'),
('ORD-2024-002', 'María García', 'maria.garcia@email.com', 'processing'),
('ORD-2024-003', 'Carlos López', 'carlos.lopez@email.com', 'pending'),
('ORD-2024-004', 'Ana Martínez', 'ana.martinez@email.com', 'completed'),
('ORD-2024-005', 'Luis Rodríguez', 'luis.rodriguez@email.com', 'processing')
ON CONFLICT DO NOTHING;

-- Insert sample order items
WITH order_data AS (
  SELECT id, order_number FROM orders WHERE order_number IN ('ORD-2024-001', 'ORD-2024-002', 'ORD-2024-003', 'ORD-2024-004', 'ORD-2024-005')
),
product_data AS (
  SELECT id, name, sale_price FROM products
)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 
  o.id,
  p.id,
  CASE 
    WHEN o.order_number = 'ORD-2024-001' AND p.name = 'Laptop Dell Inspiron 15' THEN 1
    WHEN o.order_number = 'ORD-2024-001' AND p.name = 'Mouse Logitech MX Master' THEN 2
    WHEN o.order_number = 'ORD-2024-002' AND p.name = 'Monitor Samsung 24"' THEN 1
    WHEN o.order_number = 'ORD-2024-002' AND p.name = 'Teclado Mecánico Corsair' THEN 1
    WHEN o.order_number = 'ORD-2024-003' AND p.name = 'Auriculares Sony WH-1000XM4' THEN 1
    WHEN o.order_number = 'ORD-2024-004' AND p.name = 'SSD Kingston 1TB' THEN 2
    WHEN o.order_number = 'ORD-2024-004' AND p.name = 'RAM Corsair 16GB DDR4' THEN 1
    WHEN o.order_number = 'ORD-2024-005' AND p.name = 'Impresora HP LaserJet' THEN 1
    ELSE NULL
  END as quantity,
  p.sale_price
FROM order_data o
CROSS JOIN product_data p
WHERE (
  (o.order_number = 'ORD-2024-001' AND p.name IN ('Laptop Dell Inspiron 15', 'Mouse Logitech MX Master')) OR
  (o.order_number = 'ORD-2024-002' AND p.name IN ('Monitor Samsung 24"', 'Teclado Mecánico Corsair')) OR
  (o.order_number = 'ORD-2024-003' AND p.name = 'Auriculares Sony WH-1000XM4') OR
  (o.order_number = 'ORD-2024-004' AND p.name IN ('SSD Kingston 1TB', 'RAM Corsair 16GB DDR4')) OR
  (o.order_number = 'ORD-2024-005' AND p.name = 'Impresora HP LaserJet')
)
ON CONFLICT DO NOTHING;
