import { Entity, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Length, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
import { BaseEntity } from '../../common/base.entity';

@Entity()
export class Wishlist extends BaseEntity {
  @Column()
  @IsNotEmpty()
  @Length(1, 250)
  name: string;

  @Column({ default: ' ' })
  @IsOptional()
  @Length(0, 1500)
  description: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish, (wish) => wish.wishlists)
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}
