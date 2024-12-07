import { Color, Entity, Vector, GraphicsComponent, TransformComponent, Rectangle, Engine } from "excalibur";

export class Player extends Entity {
  gComponent: GraphicsComponent;
  tComponent: TransformComponent;
  graphic: Rectangle;
  uuid: string;

  constructor(public name: string, pos: Vector, public color: string, id: string) {
    super({
      name,
    });
    this.uuid = id;
    //add transform component
    //add graphics component
    this.gComponent = new GraphicsComponent({
      anchor: Vector.Zero,
      offset: Vector.Zero,
      opacity: 1,
    });
    this.tComponent = new TransformComponent();
    this.addComponent(this.gComponent);
    this.addComponent(this.tComponent);

    this.tComponent.pos = pos;
    this.tComponent.rotation = 0;
    this.tComponent.scale = Vector.One;
    this.tComponent.z = 0;

    this.graphic = new Rectangle({
      strokeColor: Color.fromHex(this.color),
      lineWidth: 1,
      color: Color.fromHex(this.color),
      width: 16,
      height: 16,
    });

    if (color) {
      this.gComponent.use(this.graphic);
    }
  }

  onPreUpdate(engine: Engine, delta: number): void {
    //console.log(this.tComponent.pos);
  }
}
