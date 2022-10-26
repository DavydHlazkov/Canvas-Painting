import React, { useLayoutEffect, useState } from "react";
import "./App.css";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator();
function createElement(x1, y1, x2, y2) {
  const roughElement = generator.line(x1, y1, x2, y2, {
    disableMultiStroke: true,
  });
  return { x1, y1, x2, y2, roughElement };
}

function App() {
  const [elements, setElemets] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const [isDeleted, setIsDeleted] = useState(true);
  const [coordinate, setCoordinate] = useState([]);
  const [isInter, setIsInter] = useState(false);
  const [beforeContex, setBeforeContext] = useState([]);
  const [startCollapse, setStartCollapse] = useState(false);
  const [myWindow, setWindow] = useState(window.innerWidth);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, myWindow, 600);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach((el) =>
      roughCanvas.line(el.x1, el.y1, el.x2, el.y2, { stroke: "#FFF" })
    );
    coordinate.forEach((cir) =>
      roughCanvas.circle(cir.x, cir.y, 10, { stroke: "#D22B2B" })
    );
    setIsInter(false);
    setWindow(window.innerWidth);
    const interval = setInterval(() => {
      if (startCollapse === true) {
        onClickCollapse();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [elements, isInter, coordinate, startCollapse, window.innerWidth]);

  const updateCoordinate = (event) => {
    const { clientX, clientY } = event;
    const index = elements.length - 1;
    const { x1, y1 } = elements[index];
    const updatedElement = createElement(x1, y1, clientX, clientY);
    const elementCopy = [...elements];
    elementCopy[index] = updatedElement;
    setElemets(elementCopy);
  };

  function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }
    let denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    if (denominator === 0) {
      return false;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false;
    }

    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    var p = { x: x, y: y };
    setCoordinate((prevState) => [...prevState, p]);
    setIsInter(true);
    return p;
  }

  const handleClick = (event) => {
    setStartCollapse(false);
    if (isFirst) {
      const { newX, newY } = event;
      if (newX !== undefined && newY !== undefined) {
        const newElement = createElement(666, newY, newX, newY);
        setElemets((prevState) => [...prevState, newElement]);
      }
      setDrawing(false);
      setIsFirst(false);
      setIsDeleted(true);
      setBeforeContext(coordinate);
      return;
    }
    setStartCollapse(false);
    setIsDeleted(false);
    setIsFirst(true);
    setDrawing(true);
    const { clientX, clientY } = event;
    const element = createElement(clientX, clientY, clientX, clientY);
    setElemets((prevState) => [...prevState, element]);
    setBeforeContext(coordinate);
    return;
  };

  const handleMouseMove = (event) => {
    if (!drawing) return;
    updateCoordinate(event);
    setCoordinate(coordinate.slice(1, 0));
    if (elements.length >= 2) {
      let target = 0;
      let line2 = 0;
      for (let i = 0; i < elements.length; i++) {
        target = i;
        for (let j = 0; j < elements.length; j++) {
          line2 = j;
          if (target !== j) {
            intersect(
              elements[target].x1,
              elements[target].y1,
              elements[target].x2,
              elements[target].y2,
              elements[line2].x1,
              elements[line2].y1,
              elements[line2].x2,
              elements[line2].y2
            );
          }
        }
      }
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setCoordinate(beforeContex);

    if (isDeleted === false) {
      setIsFirst(false);
      setDrawing(false);
      setElemets(elements.slice(0, -1));
    }
    setIsDeleted(true);
    console.log(
      "🚀 ~ file: App.js ~ line 142 ~ handleContextMenu ~  window.innerWidth",
      window.innerWidth
    );
  };

  const getMiddle = (line) => {
    let res = {
      x: (line.x1 + line.x2) / 2,
      y: (line.y1 + line.y2) / 2,
    };
    return res;
  };

  const getLength = (x1, y1, x2, y2) => {
    let length = {
      xLength: Math.abs(x2 - x1),
      yLength: Math.abs(y2 - y1),
    };
    return length;
  };

  const getHalfLine = (line) => {
    let middleX = getMiddle(line).x;
    let middleY = getMiddle(line).y;
    let halfX = getLength(line.x1, line.y1, middleX, middleY).xLength / 15;
    let halfY = getLength(line.x1, line.y1, middleX, middleY).yLength / 15;

    let newLineX1 = line.x1 < line.x2 ? line.x1 + halfX : line.x1 - halfX;
    let newLineY1 = line.y1 < line.y2 ? line.y1 + halfY : line.y1 - halfY;
    let newLineX2 = line.x2 < line.x1 ? line.x2 + halfX : line.x2 - halfX;
    let newLineY2 = line.y2 < line.y1 ? line.y2 + halfY : line.y2 - halfY;

    setElemets((prevState) => [
      ...prevState,
      { x1: newLineX1, y1: newLineY1, x2: newLineX2, y2: newLineY2 },
    ]);
    console.log(elements);
  };

  const collapseLines = (value) => {
    if (value === true) {
      setElemets([]);
      elements.forEach((el) => getHalfLine(el));
      console.log(elements);
      setCoordinate([]);
      return;
    }
    return;
  };

  const onClickCollapse = () => {
    console.log(elements);
    setStartCollapse(true);
    collapseLines(startCollapse);
  };

  return (
    <div className="container">
      <canvas
        id="canvas"
        style={{
          backgroundColor: "#52B9B3",
          display: "flex",
        }}
        width={`${myWindow}px`}
        height={"600px"}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
      >
        Canvas
      </canvas>
      <div className="button-container">
        {!startCollapse ? (
          <button style={{ width: `${myWindow}px` }} onClick={onClickCollapse}>
            Collapse lines
          </button>
        ) : (
          <p>Press on canvas for new work</p>
        )}
      </div>
    </div>
  );
}

export default App;
