import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { WishesService } from '../wishes.service';

@Injectable()
export class WishOwnerGuard implements CanActivate {
  constructor(private readonly wishesService: WishesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const wishId = +request.params.id;
    const user = request.user;

    const wish = await this.wishesService.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to modify this wish',
      );
    }

    return true; // Authorization succeeded
  }
}
