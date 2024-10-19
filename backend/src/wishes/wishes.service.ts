import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

export interface IWishPaginator {
  data: Wish[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  private async checkOwnership(
    wishId: number,
    currentUser: User,
  ): Promise<Wish> {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (wish.owner.id !== currentUser.id) {
      throw new ForbiddenException('You are not authorized');
    }
    return wish;
  }

  private findWishesQueryBuilder(): SelectQueryBuilder<Wish> {
    return this.wishRepository
      .createQueryBuilder('wish')
      .leftJoinAndSelect('wish.owner', 'owner')
      .leftJoinAndSelect('wish.offers', 'offer')
      .leftJoinAndSelect('offer.user', 'offerUser')
      .leftJoinAndSelect('offerUser.wishes', 'userWishes')
      .leftJoinAndSelect('offerUser.offers', 'userOffers')
      .leftJoinAndSelect('offerUser.wishlists', 'wishlist')
      .leftJoinAndSelect('wishlist.owner', 'wishlistOwner')
      .leftJoinAndSelect('wishlist.items', 'wishlistItem');
  }
  async create(createWishDto: CreateWishDto, userId: number) {
    const owner = await this.usersService.findOne({ where: { id: userId } });
    const wish = this.wishRepository.create({ ...createWishDto, owner });
    return await this.wishRepository.save(wish);
  }

  async findOne(query: FindOneOptions<Wish>): Promise<Wish> {
    const wish = await this.wishRepository.findOneOrFail(query);
    return wish;
  }

  async findMany(query: FindManyOptions<Wish>): Promise<Wish[]> {
    return await this.wishRepository.find(query);
  }

  async updateOne(
    id: number,
    updateWishDto: UpdateWishDto,
    currentUser: User,
  ): Promise<Wish> {
    const wish = await this.checkOwnership(id, currentUser);
    if (wish.raised > 0) {
      throw new ForbiddenException(
        'You cannot update a wish with raised amount',
      );
    }
    await this.wishRepository.update(id, updateWishDto);
    return await this.findOne({ where: { id } });
  }

  async findAll(query: {
    page: number;
    limit: number;
  }): Promise<IWishPaginator> {
    const skip = (query.page - 1) * query.limit;
    const [data, totalCount] = await this.wishRepository.findAndCount({
      take: query.limit,
      skip,
    });
    const totalPages = Math.ceil(totalCount / query.limit);

    return {
      data,
      page: query.page,
      size: query.limit,
      totalCount,
      totalPages,
    };
  }

  async findById(id: number): Promise<Wish> {
    return await this.findWishesQueryBuilder()
      .where('wish.id = :id', { id })
      .getOneOrFail();
  }

  async findLatestWishes(): Promise<Wish[]> {
    return await this.findWishesQueryBuilder()
      .orderBy('wish.createdAt', 'DESC')
      .take(40)
      .getMany();
  }

  async findMostCopiedWishes(): Promise<Wish[]> {
    return await this.findWishesQueryBuilder()
      .orderBy('wish.copied', 'DESC')
      .take(20)
      .getMany();
  }

  async copyWish(id: number, user: User): Promise<Wish> {
    const wish = await this.findOne({ where: { id } });
    const newWish = this.wishRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      raised: 0,
      copied: 0,
      owner: user,
    });
    wish.copied += 1;
    await this.wishRepository.save([wish, newWish]);
    return newWish;
  }

  async removeOne(id: number, currentUser: User): Promise<Wish> {
    const wish = await this.checkOwnership(id, currentUser);
    await this.wishRepository.remove(wish);
    return wish;
  }
}
