# Trade-offs

Technical trade-offs for engineering decisions. These are independent of product requirements and can be decided by the engineering team.

Product and requirement questions are in `QUESTIONS.md` — those need stakeholder input.

---

## 1. ORM: TypeORM vs Prisma

| Criteria         | TypeORM                          | Prisma                           |
|------------------|----------------------------------|----------------------------------|
| NestJS integration | Native (@nestjs/typeorm)       | Requires adapter                 |
| Type safety      | Good (decorator-based)           | Excellent (generated types)      |
| Migrations       | Auto-generate + manual           | Declarative schema + migrate     |
| Query builder    | Built-in, flexible               | Limited, raw SQL fallback        |
| Learning curve   | Moderate                         | Lower                            |
| Maturity w/ Nest | Very mature, official docs       | Growing, community-driven        |

**Decision**: TypeORM - native NestJS support, well-documented, sufficient for this scope.

---

## 2. Positions: Calculated on-the-fly vs Materialized Table

| Criteria         | Calculated                       | Materialized                     |
|------------------|----------------------------------|----------------------------------|
| Consistency      | Always accurate                  | Requires sync logic              |
| Complexity       | Simpler code                     | Event-driven updates needed      |
| Read performance | Slower (aggregation queries)     | Fast (direct read)               |
| Write performance| No extra writes                  | Extra update on each order       |
| Scalability      | Degrades with order history      | Constant read time               |

**Decision**: Calculated on-the-fly. For this challenge scope the order volume is small, and consistency is more important than read performance. Avoids complexity of keeping a positions table in sync.

**Future optimization**: If performance becomes an issue, introduce a materialized view or positions table updated via database triggers.

---

## 3. Search: ILIKE vs Full-Text Search (pg_trgm)

| Criteria         | ILIKE                            | pg_trgm                          |
|------------------|----------------------------------|----------------------------------|
| Setup            | None                             | Requires extension + GIN index   |
| Partial match    | With wildcards (LIKE '%APP%')    | Native trigram similarity        |
| Fuzzy/typo       | No                               | Yes (similarity threshold)       |
| Performance      | Sequential scan without index    | Fast with GIN index              |
| Ranking          | No                               | Similarity score                 |

**Decision**: Start with ILIKE for simplicity. The instrument list is small enough that ILIKE performs well. Can add pg_trgm later if fuzzy matching is needed.

---

## 4. Validation: Application Layer vs Database Constraints

| Criteria         | App-level only                   | App + DB constraints             |
|------------------|----------------------------------|----------------------------------|
| User feedback    | Rich error messages              | Same (validate at app first)     |
| Race conditions  | Vulnerable                       | Protected via transactions       |
| Complexity       | Simpler                          | Requires transaction management  |
| Data integrity   | Depends on app correctness       | Guaranteed by DB                 |

**Decision**: Both layers.
- App-level validation with class-validator for request shape and business rules (clear error messages).
- Database transactions with SELECT FOR UPDATE to prevent race conditions on balance checks during order creation.

---

## 5. Monetary Precision

| Criteria         | JavaScript float                 | PostgreSQL NUMERIC + careful handling |
|------------------|----------------------------------|---------------------------------------|
| Precision        | Lossy (floating point errors)    | Exact decimal arithmetic              |
| Complexity       | Simple                           | Moderate (parse strings carefully)    |
| Dependencies     | None                             | None (native PG type)                 |

**Decision**: Use PostgreSQL `NUMERIC(18,2)` for all monetary columns. TypeORM maps this to JavaScript `number` by default which is acceptable for the precision needed here. For production, would use `decimal.js` or store as strings.
