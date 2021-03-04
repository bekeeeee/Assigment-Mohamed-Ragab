import "./../Board.css";

import React, { Component } from "react";
import { getData, items } from "../services/BoardData";

import { Draggable, Droppable, DragDropContext } from "react-beautiful-dnd";
import io from "socket.io-client";
var store = require("store");

const socket = io("http://localhost:5555");

class Board extends Component {
  state = { items: items[0], team_id: 0, isDraggable: false };

  componentDidMount() {
    const team_id = this.props.match.params.team_id.split("=")[1];
    const user_id = this.props.match.params.user_id.split("=")[1];

    console.log("componentDidMount Board");

    socket.on("new-action", ({ items, team_id }) => {
      if (team_id === this.state.team_id) this.setState({ items });
    });

    if (team_id > 2 || team_id < 1 || user_id > 4 || user_id < 1) {
      this.props.history.replace("/not-found");
    }
    if (team_id === 1 && user_id > 2) this.props.history.replace("/not-found");
    if (team_id === 2 && user_id < 2) this.props.history.replace("/not-found");

    const items =
      store.get("data") && store.get("team_id") === team_id
        ? store.get("data")
        : getData(team_id);

    this.setState({ items, team_id });
  }

  onDragStart = (result) => {
    const { source } = result;

    if (source.index === 1) {
      const items = { ...this.state.items };
      items[source.droppableId].tesxtDragging = true;
      this.setState({ items });
    }
    this.setState({ isDraggable: true });
  };
  onDragEnd = (result) => {
    const { destination, source, reason } = result;

    const items = { ...this.state.items };
    items[source.droppableId].tesxtDragging = false;
    // Not a thing to do...
    if (!destination || reason === "CANCEL") {
      return;
    }

    if (destination.droppableId === source.droppableId) {
      return;
    }
    if (source.index === 1) {
      items[destination.droppableId].coins += 1;
      items[source.droppableId].coins -= 1;
    } else {
      items[destination.droppableId].coins += items[source.droppableId].coins;
      items[source.droppableId].coins = 0;
    }
    const team_id = this.state.team_id;
    store.set("data", items);
    store.set("team_id", team_id);

    socket.emit("action", { items, team_id });

    this.setState(items);
    this.setState({ isDraggable: false });
  };
  checkDraggable = () => {};
  renderContainer = (name) => {
    const container = this.state.items[name];

    return (
      <div>
        <Droppable
          key={container.name + "key"}
          droppableId={container.name}
          style={{ position: "static" }}
        >
          {(provided) => (
            <div
              key={container.name}
              className={container.divClass}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {container.p && <p>{container.p}</p>}
              {container.coins > 0 &&
                (container.isDragging || this.state.isDraggable) && (
                  <Draggable
                    key={container.name + "circle"}
                    draggableId={container.name + " "}
                    index={0}
                  >
                    {(provided) => (
                      <div
                        className={container.circle}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className={container.smallCircle}>
                          <Draggable
                            key={container.name + "title"}
                            draggableId={container.name + "title"}
                            index={1}
                          >
                            {(provided) => (
                              <div
                                id="text"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {container.tesxtDragging ? 1 : container.coins}
                              </div>
                            )}
                          </Draggable>
                        </div>
                        {container.tesxtDragging ? (
                          <div id="text">{container.coins - 1} </div>
                        ) : (
                          ""
                        )}
                      </div>
                    )}
                  </Draggable>
                )}
              {!container.isDragging && (
                <div className={container.circle}>
                  <div id="text">{container.coins}</div>
                </div>
              )}
              {container.coins < 1 && (
                <div className={container.circle}>
                  <div id="text">0</div>
                </div>
              )}
              <span>{container.span}</span>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  renderBoard = () => {
    return (
      <div className="grid-container">
        {this.renderContainer("GoodSold")}

        {this.renderContainer("RMP")}
        <div className="owners-lenders-community">
          <div className="owners">
            <p>owners</p>
            {this.renderContainer("dividends")}
            {this.renderContainer("equity")}
          </div>
          <div className="lenders">
            <p>lenders</p>
            {this.renderContainer("interest")}
            {this.renderContainer("liabilities")}
          </div>
          <div className="community">
            <p>the community</p>
            {this.renderContainer("taxes")}
          </div>
        </div>
        <div className="production-cash">
          <div className="Cash">
            <hr className="dashed" width="20%" />
            {this.renderContainer("Cash")}
            <hr className="dashed" width="20%" />
            {this.renderContainer("accountsReceivable")}
            <hr className="dashed" width="20%" />
          </div>
          <div className="Production">
            <p>Production</p>
            <div> {this.renderContainer("stockOfMaterial")}</div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    console.log("render board");
    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
        onDragStart={this.onDragStart}
      >
        <div className="grid-container">
          <Droppable droppableId="dp1" style={{ position: "static" }}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {this.renderBoard()}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    );
  }
}

export default Board;
