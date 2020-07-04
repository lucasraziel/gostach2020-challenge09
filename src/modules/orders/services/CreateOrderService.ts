import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

interface IProductOrder {
  product_id: string;
  quantity: number;
  price: number;
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const ids = products.map(product => ({
      id: product.id,
    }));

    console.log(products);

    const productsInStock = await this.productsRepository.findAllById(ids);

    console.log(productsInStock);

    const productInsStockUpdated: IProduct[] = [];

    const productsOrder: IProductOrder[] = [];

    productsInStock.forEach(product => {
      const indexProduct = products.findIndex(item => item.id === product.id);

      if (indexProduct < 0) {
        throw new AppError('inconsistência nos dados');
      }

      const quantitySold = products[indexProduct].quantity;

      const quantityUpdated = product.quantity - quantitySold;

      if (quantityUpdated < 0) {
        throw new AppError('Estoque insuficiente');
      }

      productInsStockUpdated.push({
        id: product.id,
        quantity: quantityUpdated,
      });

      productsOrder.push({
        product_id: product.id,
        price: product.price,
        quantity: quantitySold,
      });
    });

    console.log(productInsStockUpdated);

    console.log(productsOrder);

    const customer = await this.customersRepository.findById(customer_id);

    console.log(customer);

    if (!customer) {
      throw new AppError('Cliente inexistente');
    }

    const order = await this.ordersRepository.create({
      customer,
      products: productsOrder,
    });

    console.log(order);

    await this.productsRepository.updateQuantity(productInsStockUpdated);

    return order;
  }
}

export default CreateOrderService;
