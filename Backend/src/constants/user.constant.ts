export interface UserWhereConditionProps {
  username?: string;
  isAdmin?: boolean;
}

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
    console.log("isAdmin Değeri:", isAdmin);

    whereClause.isAdmin = isAdmin === "true";
  }

  console.log("Kullanıcı filtresi:", whereClause);

  return whereClause;
};