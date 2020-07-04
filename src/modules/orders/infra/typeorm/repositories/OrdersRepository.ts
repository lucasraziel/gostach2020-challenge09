import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import Order from '../entities/Order';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  private ormRepositoryOrderProducts: Repository<OrdersProducts>;

  private ornRepositoryCustomer: Repository<Customer>;

  constructor() {
    this.ormRepository = getRepository(Order);
    this.ormRepositoryOrderProducts = getRepository(OrdersProducts);
    this.ornRepositoryCustomer = getRepository(Customer);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const customerFound = await this.ornRepositoryCustomer.findOne(customer.id);

    console.log(customerFound);

    console.log(customer);

    let order = this.ormRepository.create({
      customer_id: customer.id,
      order_products: [],
    });

    console.log(order);

    try {
      order = await this.ormRepository.save(order);
    } catch (err) {
      console.log(err);
    }

    console.log(order);

    const orderProductsObject = products.map(product => ({
      product_id: product.product_id,
      order_id: order.id,
      price: product.price,
      quantity: product.quantity,
    }));
    const orderProducts = this.ormRepositoryOrderProducts.create(
      orderProductsObject,
    );

    console.log(orderProducts);

    order.order_products = orderProducts;

    console.log(order);
    try {
      order = await this.ormRepository.save(order);
    } catch (err) {
      console.log(err.message);
    }
    console.log(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    return this.ormRepository.findOne(id);
  }
}

export default OrdersRepository;
