import { IPopulationHandler } from '../interfaces/IPopulationHandler';

export abstract class AbstractPopulate<T> implements IPopulationHandler<T> {

    abstract Get(): T;
    
}