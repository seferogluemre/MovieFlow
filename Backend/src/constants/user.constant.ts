export interface UserWhereConditionProps {
    username?: string;
    isAdmin?: boolean;
}

export const USER_WHERE_CLAUSE = (query: Record<string, any>): UserWhereConditionProps => {
    const { username, isAdmin } = query;

    const whereClause: UserWhereConditionProps = {};

    console.log("Query Parametreleri:", query);

    // username filtresi ekleme
    if (username && username.length > 2) {
        whereClause.username = { contains: username };  // username 3 harften fazla ise filtrele
    }

    // isAdmin filtresi ekleme
    if (isAdmin !== undefined) {
        console.log("isAdmin Değeri:", isAdmin);  

        whereClause.isAdmin = isAdmin === "true";
    }

    console.log("Kullanıcı filtresi:", whereClause);  

    return whereClause;
};
