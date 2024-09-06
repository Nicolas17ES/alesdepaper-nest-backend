import { EntitySchemaIndexOptions } from 'typeorm';
import {User} from './user.entity';
import { RefreshToken} from './refresh-token.entity';
import { Product} from './products.entity';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';

const entities = [User, RefreshToken, Product, Order, OrderItem];

export default entities;