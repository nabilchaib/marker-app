import { Menu, MenuItem, SwipeableDrawer, useMediaQuery } from '@mui/material';
import { classNames, colors } from '../../utils';


const initialAnchorOrigin = {
  vertical: 'bottom',
  horizontal: 'right',
};

const initialTransformOrigin = {
  vertical: 'top',
  horizontal: 'left',
};

const Dropdown = ({ entity, items, anchorEl, open, onOpen, onClose, anchorOrigin = initialAnchorOrigin, transformOrigin = initialTransformOrigin }) => {
  const isMobile = useMediaQuery('(max-width:600px)');

  const renderMenuItems = (options = {}) => {
    const { isDrawer = false } = options;
    return items.map((item) =>
      <MenuItem
        key={item.text.toLowerCase()}
        disableRipple
        sx={{
          '&': {
            borderRadius: isDrawer ? '0' : '0.75rem',
            padding: isDrawer ? '0.25rem' : '0',
            minHeight: isDrawer ? '0px' : 'auto'
          },
          '&:hover, &.Mui-focusVisible, &:active': {
            backgroundColor: colors.grey200,
          },
        }}
        onClick={e => {
          if (isDrawer) {
            onClose();
          }

          item.onClick(entity);
        }}
      >
        <button className={classNames(isDrawer ? 'outline-none' : 'rounded-lg', 'py-1.5 px-3 group flex w-full items-center gap-2 focus-visible:outline-orange-600')}>
          <item.icon className="size-4" />
          {item.text}
        </button>
      </MenuItem>
    );
  };

  return (
    <>
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onOpen={onOpen}
          onClose={onClose}
        >
          {renderMenuItems({ isDrawer: true })}
        </SwipeableDrawer>
      ) : (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={onClose}
          transitionDuration={0}
          elevation={0}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
          sx={{
            '& .MuiPaper-root': {
              border: `1px solid ${colors.grey200}`,
              borderRadius: '0.75rem',
              padding: '0.25rem',
              minWidth: '12rem'
            },
            '& .MuiList-root': {
              padding: 0,
            },
          }}
        >
          {renderMenuItems()}
        </Menu>
      )}
    </>
  );
};

export default Dropdown;
