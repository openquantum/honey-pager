import drop from 'lodash/drop';
import dropRight from 'lodash/dropRight';
import head from 'lodash/first';
import tail from 'lodash/last';
import forEach from 'lodash/forEach';
import isFunction from 'lodash/isFunction';
import { validateCursor, generateCursor } from './cursor-helpers';
import debugModule from 'debug';
const debug = debugModule('honey-pager');

export default () => {
  return async function (query = {}, args = {}, opts = {}) {
    if (args.first !== undefined && args.last !== undefined) {
      throw new TypeError('first and last cannot be set at the same time.');
    }

    let { after, before } = args;

    if (after) {
      after = validateCursor(after);
    }
    if (before) {
      before = validateCursor(before);
    }

    const anyCursor = after || before;

    if (args.filters || (anyCursor && anyCursor.filters)) {
      const filtersToUse =
        anyCursor && anyCursor.filters ? anyCursor.filters : args.filters;
      forEach(filtersToUse, (value, name) => {
        let condition = { [name]: value };
        if (!opts.filterFields || !opts.filterFields[name]) {
          return;
        }

        if (isFunction(opts.filterFields[name])) {
          condition = opts.filterFields[name](value);
        }

        if (!query.$and) query = { ...query, $and: [query] };

        query.$and.push(condition);
      });
    }

    if (args.search) {
      const s = (opts.searchFields || []).map((v) => {
        const filter = {};
        filter[v] = { $regex: `${args.search}`, $options: 'i' };
        return filter;
      });
      if (!query.$and) query = { ...query, $and: [query] };

      query.$and.push({ $or: s });
    }

    const totalCount = await this.countDocuments(query);
    const { first, last } = args;
    const limit = first || last || 1000;
    let isDescSort = false;
    if (args.sort && args.sort.order === 'desc') {
      isDescSort = true;
    }

    if (
      args.sort &&
      Array.isArray(args.sort) &&
      args.sort[0].order === 'desc'
    ) {
      isDescSort = true;
    }
    let hasNextPage = false,
      hasPreviousPage = false,
      skip = 0,
      sort = {};

    const buildCursorCondition = (cursor, way) => {
      return { _id: { [way]: cursor } };
    };

    let dataQuery = query;
    if (after) {
      dataQuery = {
        ...dataQuery,
        ...buildCursorCondition(after, isDescSort ? '$lt' : '$gt'),
      };
      hasPreviousPage = true;
    } else if (before) {
      if (!dataQuery.$and) dataQuery = { ...dataQuery, $and: [] };

      dataQuery.$and.push(
        buildCursorCondition(before, isDescSort ? '$gt' : '$lt')
      );
      hasNextPage = true;
    }

    const hasOffset = !(hasNextPage && hasPreviousPage);

    if (last) {
      let offset = totalCount - last - (hasOffset ? 1 : 0);
      if (before) {
        const dataCount = await this.countDocuments(dataQuery);
        offset = dataCount - last - 1;
      }
      skip = offset < 0 ? 0 : offset;
    }

    if (args.sort) {
      debug(args.sort);
      if (Array.isArray(args.sort)) {
        sort = {
          ...args.sort.reduce((acc, cur) => {
            acc[cur.by] = cur.order;
            return acc;
          }, {}),
          _id: isDescSort ? 'desc' : 'asc',
        };
      } else {
        let { order = 'desc' } = args.sort;
        sort = {
          [args.sort.by]: order,
          _id: order,
        };
      }
    }

    debug(dataQuery);
    debug(sort);
    let data = await this.find(dataQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit + (hasOffset ? 1 : 0));

    debug(data);
    if (hasOffset && data.length > limit) {
      if (first) hasNextPage = true;

      if (last) hasPreviousPage = true;

      if (first) {
        data = dropRight(data);
      } else if (last) {
        data = drop(data);
      }
    }

    const edges = data.map((v) => ({
      cursor: generateCursor(v),
      node: v,
    }));

    return {
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor: head(edges) ? head(edges).cursor : null,
        endCursor: tail(edges) ? tail(edges).cursor : null,
      },
      edges,
    };
  };
};
