import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Connection,
  FindManyOptions,
  FindOneOptions,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    private readonly connection: Connection,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish) private readonly wishRepository: Repository<Wish>,
  ) {}

  private findOfferQueryBuilder(): SelectQueryBuilder<Offer> {
    return this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.user', 'user')
      .leftJoinAndSelect('user.wishes', 'userWishes')
      .leftJoinAndSelect('user.offers', 'userOffers')
      .leftJoinAndSelect('user.wishlists', 'wishlist')
      .leftJoinAndSelect('wishlist.owner', 'wishlistOwner')
      .leftJoinAndSelect('wishlist.items', 'wishlistItem');
  }
  async create(createOfferDto: CreateOfferDto, user: User) {
    const { amount, itemId, hidden } = createOfferDto;
    const querryRunner = this.connection.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction();
    try {
      const wish = await querryRunner.manager.findOneOrFail(Wish, {
        where: { id: itemId },
        relations: ['owner'],
      });
      if (wish.owner.id === user.id) {
        throw new ForbiddenException('You cannot offer on your own wish');
      }
      const rest = wish.price - wish.raised;
      if (amount > rest) {
        throw new ForbiddenException('Offer amount exceeds remaining amount');
      }
      const offer = await this.offerRepository.create({
        item: wish,
        amount,
        hidden,
        user,
      });

      wish.raised = parseFloat(
        (parseFloat(wish.raised.toString()) + amount).toFixed(2),
      );
      await querryRunner.manager.save(wish);

      await querryRunner.manager.save(offer);
      await querryRunner.commitTransaction();

      return offer;
    } catch (error) {
      await querryRunner.rollbackTransaction();
      throw error;
    } finally {
      await querryRunner.release();
    }
  }

  async findMany(query: FindManyOptions<Offer>): Promise<Offer[]> {
    return await this.offerRepository.find(query);
  }

  async findOffers(): Promise<Offer[]> {
    return await this.findOfferQueryBuilder().getMany();
  }

  async findOffer(id: number): Promise<Offer> {
    return await this.findOfferQueryBuilder()
      .where('offer.id = :id', { id })
      .getOne();
  }

  async findOne(query: FindOneOptions<Offer>): Promise<Offer> {
    const offer = await this.offerRepository.findOneOrFail(query);
    return offer;
  }
}
