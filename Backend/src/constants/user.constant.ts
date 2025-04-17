import { UserWhereConditionProps } from "@/types/types";

export const USER_WHERE_CLAUSE = (
  query: Record<string, any>
): UserWhereConditionProps => {
  const { username, isAdmin } = query;

  const whereClause: UserWhereConditionProps = {};

  console.log("Query Parametreleri:", query);

  if (username && username.length > 2) {
    whereClause.username = { contains: username };
  }

  if (isAdmin !== undefined) {
    whereClause.isAdmin = isAdmin === "true";
  }

  return whereClause;
};
