import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

class Cache {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on("connect", () => {
      console.log("Redis bağlantısı başarılı");
    });

    this.client.on("error", (err) => {
      console.error("Redis bağlantı hatası:", err);
    });
  }

  // Set operations
  async addToSet(key: string, value: string | string[]): Promise<void> {
    try {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          await this.client.sadd(key, ...value);
        }
      } else {
        await this.client.sadd(key, value);
      }
    } catch (error) {
      console.error(`Error adding to set ${key}:`, error);
    }
  }

  async removeFromSet(key: string, value: string | string[]): Promise<void> {
    try {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          await this.client.srem(key, ...value);
        }
      } else {
        await this.client.srem(key, value);
      }
    } catch (error) {
      console.error(`Error removing from set ${key}:`, error);
    }
  }

  async isMemberOfSet(key: string, value: string): Promise<boolean> {
    try {
      return (await this.client.sismember(key, value)) === 1;
    } catch (error) {
      console.error(`Error checking set membership for ${key}:`, error);
      return false;
    }
  }

  async getSetMembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      console.error(`Error getting set members for ${key}:`, error);
      return [];
    }
  }

  async getSetSize(key: string): Promise<number> {
    try {
      return await this.client.scard(key);
    } catch (error) {
      console.error(`Error getting set size for ${key}:`, error);
      return 0;
    }
  }

  // Hash operations
  async setHashField(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hset(key, field, value);
    } catch (error) {
      console.error(`Error setting hash field ${field} for ${key}:`, error);
    }
  }

  async getHashField(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      console.error(`Error getting hash field ${field} for ${key}:`, error);
      return null;
    }
  }

  async setMultipleHashFields(
    key: string,
    fieldValues: Record<string, string>
  ): Promise<void> {
    try {
      await this.client.hset(key, fieldValues);
    } catch (error) {
      console.error(`Error setting multiple hash fields for ${key}:`, error);
    }
  }

  async getAllHashFields(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      console.error(`Error getting all hash fields for ${key}:`, error);
      return {};
    }
  }

  // String operations
  async setValue(
    key: string,
    value: string,
    expireInSeconds?: number
  ): Promise<void> {
    try {
      if (expireInSeconds) {
        await this.client.set(key, value, "EX", expireInSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error(`Error setting value for ${key}:`, error);
    }
  }

  async getValue(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Error getting value for ${key}:`, error);
      return null;
    }
  }

  // List operations
  async addToList(key: string, value: string | string[]): Promise<void> {
    try {
      if (Array.isArray(value)) {
        for (const item of value) {
          await this.client.rpush(key, item);
        }
      } else {
        await this.client.rpush(key, value);
      }
    } catch (error) {
      console.error(`Error adding to list ${key}:`, error);
    }
  }

  async getListItems(key: string, start = 0, end = -1): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, end);
    } catch (error) {
      console.error(`Error getting list items for ${key}:`, error);
      return [];
    }
  }

  // General operations
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      console.error(`Error checking if key ${key} exists:`, error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      console.error(`Error setting expiry on key ${key}:`, error);
    }
  }

  // For direct client access if needed
  getClient(): Redis {
    return this.client;
  }
}

export default new Cache();
