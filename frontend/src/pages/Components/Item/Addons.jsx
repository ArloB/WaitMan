import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const Addons = ({ list, order, modifyPrice }) => {
  const { register, handleSubmit } = useForm();
  const [prices, setPrices] = useState({});

  useEffect(() => {
    setPrices({});

    list.map(({ options, id }) =>
      options.map((option) => {
        if (option?.checked) {
          setPrices((prev) => ({ ...prev, [id]: option.price }));
        }
      })
    );
  }, [list]);

  const handleRadio = (id, new_amount) => {
    if (id in prices) {
      modifyPrice(prices[id], true);
    }

    modifyPrice(new_amount);

    setPrices({ ...prices, [id]: new_amount });
  };

  return (
    <div className="overflow-auto min-h-0 w-3xl">
      <form id="addon-form" onSubmit={handleSubmit(order)}>
        {list.map((addon) => {
          return (
            <div key={addon.id} className="form-control">
              <h3 className="mt-4">{addon.title}</h3>
              {addon.options.map((option, i) => {
                return (
                  <label
                    className="label cursor-pointer"
                    key={`${addon.id}${i}`}
                  >
                    <div className="flex w-3xl">
                      {!addon.type ? (
                        <input
                          type="radio"
                          placeholder={option.name}
                          className="radio"
                          {...register(`{type:r,id:${addon.id}}`, {})}
                          value={option.name}
                          onChange={() => handleRadio(addon.id, option.price)}
                          defaultChecked={option?.checked ?? false}
                        />
                      ) : (
                        <input
                          type="checkbox"
                          placeholder={option.name}
                          className="checkbox"
                          {...register(
                            `{type:c,id:${addon.id},name:${option.name}}`,
                            {}
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              modifyPrice(option.price);
                            } else {
                              modifyPrice(option.price, true);
                            }
                          }}
                          defaultChecked={option?.checked ?? false}
                        />
                      )}
                      <span className="ml-4 label-text">{option.name}</span>
                    </div>
                    {option.price > 0 && <span>+ ${option.price}</span>}
                  </label>
                );
              })}
            </div>
          );
        })}
      </form>
    </div>
  );
};

export default Addons;
