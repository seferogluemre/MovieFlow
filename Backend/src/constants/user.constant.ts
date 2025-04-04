export const USER_FILTERS = {
    username: "",
    isAdmin: "isAdmin",
};

export const USER_WHERE_CLAUSE = (query: Record<string, any>) => {
    const { username, isAdmin } = query;

    const whereClause: Record<string, any> = {};

    if (username && username.length > 2) {
        whereClause.username = { contains: username };
    }

    if (isAdmin !== undefined) {
        whereClause.isAdmin = isAdmin === "true";
    }

    return whereClause;
};