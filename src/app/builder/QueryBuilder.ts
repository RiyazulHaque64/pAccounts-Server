import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public queryModel: Query<T[], T>;
  public query: Record<string, unknown>;
  constructor(queryModel: Query<T[], T>, query: Record<string, unknown>) {
    this.queryModel = queryModel;
    this.query = query;
  }
  search(searchableField: string[]) {
    if (this.query?.searchTerm) {
      this.queryModel = this.queryModel.find({
        $or: searchableField.map(
          (field) =>
            ({
              [field]: { $regex: this.query?.searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }
    return this;
  }
  filter() {
    const queryObj = { ...this.query };
    const excludeField = ['searchTerm', 'sort', 'select', 'limit', 'page'];
    excludeField.forEach((field) => delete queryObj[field]);

    this.queryModel = this.queryModel.find(queryObj as FilterQuery<T>);
    return this;
  }
  sort() {
    const sort =
      (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.queryModel.sort(sort);
    return this;
  }
  limit() {
    const limit = Number(this.query?.limit) || 0;
    this.queryModel = this.queryModel.limit(limit);
    return this;
  }
  paginate() {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 0;
    const skip = (page - 1) * limit;
    this.queryModel = this.queryModel.skip(skip);
    return this;
  }
  fields() {
    const fields = (this.query?.select as string)?.split(',')?.join(' ') || '';
    this.queryModel = this.queryModel.select(fields);
    return this;
  }
}

export default QueryBuilder;
