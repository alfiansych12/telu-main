// material-ui
import Chip from '@mui/material/Chip';

// ==============================|| ROW SELECTION - PREVIEW ||============================== //

export const RowSelection = ({ total, selected }: { total: number; selected: number }) => (
  <>
    {selected > 0 && (
      <Chip
        size="small"
        label={` ${selected} of ${total} row(s) selected`}
        color="primary"
        variant="combined"
        sx={{ position: 'absolute', right: -1, top: -1, borderRadius: '0 4px 0 4px' }}
      />
    )}
  </>
);

export default RowSelection;
