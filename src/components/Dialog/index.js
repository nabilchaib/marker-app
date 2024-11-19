import { Dialog, SwipeableDrawer, useMediaQuery } from '@mui/material';
import Icon from '../Icon';
import { colors } from '../../utils';


const CustomDialog = ({ title, open, handleClose, onConfirm, confirmButtonTitle, loading }) => {
  const isMobile = useMediaQuery('(max-width:640px)');

  const renderMenu = () => {
    return (
      <div className="p-4">
        <div className="">
          {title}
        </div>

        <div className="flex-col sm:flex-row mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="w-full sm:w-20 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent focus-visible:outline-orange-600"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="flex justify-center items-center relative w-full sm:w-20 rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            onClick={onConfirm}
          >
            {loading && (
              <Icon type="loader" className="h-5 w-5" spinnerColor={colors.cyan600} spinnerBackgroundColor={colors.grey300} />
            )}
            {!loading && confirmButtonTitle}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          aria-labelledby={title}
        >
          {renderMenu()}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby={title}
        >
          {renderMenu()}
        </Dialog>
      )}
    </>
  );
};

export default CustomDialog;
