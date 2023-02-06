import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import DraggableItems from "./DraggableItems";
import api from "../../../axios";

const ItemsTable = () => {
  const itemData = useLoaderData();
  const [categories, setCategories] = useState([]);
  const [items, setItemList] = useState([]);

  useEffect(() => {
    setCategories(itemData.categories);
    setItemList(itemData.items);
  }, [itemData]);

  const onDragEnd = (e) => {
    if (!e.destination) {
      return;
    }

    const sorted = reorder(categories, e.source.index, e.destination.index);
    setCategories(sorted);

    api.put(`/category_order`, { ordered_categories: sorted });
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [tooltipText, setTooltipText] = useState("Show items");

  const handleExpand = (e) => {
    setIsExpanded(!isExpanded);
    if (tooltipText === "Show items") {
      setTooltipText("Hide items");
    } else {
      setTooltipText("Show items");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="table">
        {(provided) => (
          <table
            className="table w-full"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <thead>
              <tr>
                <th className="w-10">
                  <div
                    className="tooltip tooltip-bottom"
                    data-tooltip-style="light"
                    data-tip={tooltipText}
                  >
                    <button
                      className="btn btn-square btn-xs"
                      onClick={handleExpand}
                    >
                      {isExpanded ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </th>
                <th scope="col" className="text-center text-base">
                  Categories
                </th>
                {isExpanded && (
                  <th scope="col" className="text-center text-base">
                    Items
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, i) => (
                <Draggable
                  key={`${category.id}-${category.name}`}
                  draggableId={`${category.id}-${category.name}`}
                  index={i}
                >
                  {(provided) => (
                    <tr
                      key={i}
                      className="hover cursor-pointer"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <td className="text-center">{i + 1}</td>
                      <td className="text-center" {...provided.dragHandleProps}>
                        {category.name}
                      </td>
                      {isExpanded && (
                        <td className="content-center">
                          <div className="grow justify-evenly">
                            <DraggableItems
                              category_id={category.id}
                              reorder={reorder}
                              itemState={[items, setItemList]}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  )}
                </Draggable>
              ))}
            </tbody>
            {provided.placeholder}
          </table>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ItemsTable;
