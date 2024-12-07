export enum EntityType {
  Player,
  Enemy,
}

export class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Entity {
  UserId: string = "";
  name: string;
  velocity: Vector;
  color: string;
  id = UUID.generateUUID();
  type: EntityType;
  position: Vector;
  width: number;
  height: number;

  constructor(name: string, type: EntityType, size: Vector, position: Vector, color: string) {
    this.width = size.x;
    this.height = size.y;
    this.name = name;
    this.type = type;
    this.position = position;
    if (type === EntityType.Enemy) {
      this.color = "#FF0000";
    } else this.color = color;
    this.velocity = new Vector(0, 0);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

export class Enemy extends Entity {
  target: Vector;
  stepx: number;
  stepy: number;

  constructor(position: Vector) {
    super("enemy", EntityType.Enemy, new Vector(16, 16), position, "#FF0000");
    this.target = new Vector(Math.random() * 800, Math.random() * 600);
    const dx = this.target.x - this.position.x;
    const dy = this.target.y - this.position.y;

    this.stepx = dx / 500;
    this.stepy = dy / 500;
  }

  update(): void {
    this.position.x += this.stepx;
    this.position.y += this.stepy;

    if (this.position.x == this.target.x && this.position.y == this.target.y) {
      //generate new target
      this.target = new Vector(Math.random() * 800, Math.random() * 600);
      const dx = this.target.x - this.position.x;
      const dy = this.target.y - this.position.y;

      this.stepx = dx / 500;
      this.stepy = dy / 500;
    }
  }
}

class UUID {
  static generateUUID(): string {
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return uuid.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
