import { useState, memo } from 'react';
import { ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import { classNames } from '../../utils';
import Dropdown from '../Dropdown';

const ListItem = ({
  item,
  onSelectItem,
  dropdownItems,
  hasChevron,
  Item,
}) => {
  const [dropdownEl, setDropdownEl] = useState(null);
  const dropdownOpen = Boolean(dropdownEl);

  const onOpenDropdown = (e) => {
    setDropdownEl(e.currentTarget);
  };

  const onCloseDropdown = () => {
    setDropdownEl(null);
  };

  return (
    <li
      key={item.id}
      className={classNames(!dropdownOpen && onSelectItem ? 'hover:bg-orange-100' : '', onSelectItem ? 'cursor-pointer' : '')}
    >
      <div className="group relative">
        <Item item={item} onSelectItem={onSelectItem} />

        {dropdownItems && (
          <button onClick={onOpenDropdown} className="absolute top-1/2 -translate-y-1/2 right-4 focus-visible:outline-orange-600 outline-none focus-visible:rounded-md">
            <EllipsisHorizontalIcon aria-hidden="true" className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        )}
        {hasChevron && (
          <div className="absolute top-1/2 -translate-y-1/2 right-4">
            <ChevronRightIcon aria-hidden="true" className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          </div>
        )}
        {dropdownItems && (
          <Dropdown entity={item} anchorEl={dropdownEl} open={dropdownOpen} items={dropdownItems} onOpen={onOpenDropdown} onClose={onCloseDropdown} />
        )}
      </div>
    </li>
  );
}

const List = ({ items, onSelectItem, dropdownItems, hasChevron = false, children }) => {
  return (
    <ul role="list" className="mt-6 divide-y divide-gray-200 border-b border-t border-gray-200">
      {items.allIds.map((itemId) => {
        const item = items.byId[itemId];
        return (
          <ListItem Item={children} key={item.id} item={item} onSelectItem={onSelectItem} dropdownItems={dropdownItems} hasChevron={hasChevron} />
        );
      })}
    </ul>
  );
};

export default memo(List, (prevProps, nextProps) => prevProps.items === nextProps.items && prevProps.children === nextProps.children);
