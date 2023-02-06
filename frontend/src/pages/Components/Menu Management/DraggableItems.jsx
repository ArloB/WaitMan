import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Enabled from "../Enabled";
import api from "../../../axios";

const DraggableItems = ({ category_id, reorder, itemState }) => {
  const [items, setItemList] = itemState;
  const navigate = useNavigate();

  const onDragEnd = (e) => {
    if (!e.destination) {
      return;
    }
    const sorted = reorder(items, e.source.index, e.destination.index);
    setItemList(sorted);

    api.put(`/item_order`, { ordered_items: sorted });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="items">
        {(provided) => (
          <table
            className="items w-full"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <tbody>
              {items.map((item, i) => {
                if (item.category_id === category_id) {
                  return (
                    <Draggable
                      key={`${item.category_id}-${item.id}`}
                      draggableId={`${item.category_id}-${item.id}`}
                      index={i}
                    >
                      {(provided) => (
                        <tr
                          className="hover !cursor-pointer !active:cursor-grabbing"
                          onClick={() =>
                            navigate(`/admin/menu/edit/${item.id}`)
                          }
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <td className="text-left">{item.name}</td>
                          <td className="text-center">${item.price}</td>
                          <td className="text-right">
                            <Enabled on={item.availability} />
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  );
                }

                return null;
              })}

              {provided.placeholder}
            </tbody>
          </table>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableItems;
