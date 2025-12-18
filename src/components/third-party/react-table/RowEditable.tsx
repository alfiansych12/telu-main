'use client';

import { useEffect, useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// third-party
import * as yup from 'yup';
import { Formik, Form } from 'formik';
import { Row, RowData, Table } from '@tanstack/react-table';

// project-imports
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';

type RowEditProps<T extends RowData> = {
  getValue: () => any;
  row: Row<T>;
  column: any;
  table: Table<T>;
};

// ==============================|| EDITABLE ROW ||============================== //

export default function RowEditable<T extends RowData>({ getValue: initialValue, row, column: { id, columnDef }, table }: RowEditProps<T>) {
  const [value, setValue] = useState(initialValue);
  const tableMeta = table.options.meta;

  const onChange = (e: any) => {
    setValue(e.target?.value);
  };

  const onBlurUpdate = () => {
    tableMeta!.updateData(row.index, id, value);
    // console.log(row.index, id, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const ShowStatus = (value: string) => {
    switch (value) {
      case 'UTAMA':
        return <Chip color="success" label="UTAMA" size="small" variant="light" />;
      case 'SEKUNDER':
      default:
        return <Chip color="info" label="SEKUNDER" size="small" variant="light" />;
    }
  };

  let element;
  let itemInfoSchema;
  switch (id) {
    case 'email':
      itemInfoSchema = yup.object().shape({
        itemInfo: yup.string().email('Enter valid email ').required('Email is required')
      });
      break;
    case 'age':
      itemInfoSchema = yup.object().shape({
        itemInfo: yup
          .number()
          .typeError('Age must be number')
          .required('Age is required')
          .min(18, 'You must be at least 18 years')
          .max(65, 'You must be at most 65 years')
      });
      break;
    case 'visits':
      itemInfoSchema = yup.object().shape({
        itemInfo: yup.number().typeError('Visits must be number').required('Visits are required')
      });
      break;
    case 'lastName':
      itemInfoSchema = yup.object().shape({
        itemInfo: yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name is required')
      });
      break;
    default:
      itemInfoSchema = yup.object().shape({
        itemInfo: yup.string().max(500, 'Too Long!').required('This field is required')
      });
      break;
  }

  const isEditable = tableMeta?.selectedRow[row.id];

  switch (columnDef.dataType) {
    case 'text':
      element = (
        <>
          {isEditable ? (
            <>
              <Formik
                initialValues={{
                  itemInfo: value
                }}
                enableReinitialize
                validationSchema={itemInfoSchema}
                onSubmit={() => {}}
              >
                {({ values, handleChange, handleBlur, errors, touched }) => (
                  <Form>
                    <TextField
                      value={values.itemInfo}
                      id={`${row.index}-${id}`}
                      name="itemInfo"
                      onChange={(e) => {
                        handleChange(e);
                        onChange(e);
                      }}
                      onBlur={(e) => {
                        // handleBlur(e);
                        onBlurUpdate();
                      }}
                      error={touched.itemInfo && Boolean(errors.itemInfo)}
                      helperText={touched.itemInfo && errors.itemInfo && (errors.itemInfo as string)}
                      sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1 }, width: 1 }}
                    />
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            value
          )}
        </>
      );
      break;
    case 'select':
      element = (
        <>
          {isEditable ? (
            <Select
              labelId="editable-select-label"
              sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1 } }}
              id="editable-select"
              value={value}
              onChange={onChange}
              onBlur={onBlurUpdate}
            >
              <MenuItem value="UTAMA">
                <Chip color="success" label="UTAMA" size="small" variant="light" />
              </MenuItem>
              <MenuItem value="SEKUNDER">
                <Chip color="info" label="SEKUNDER" size="small" variant="light" />
              </MenuItem>
            </Select>
          ) : (
            ShowStatus(value)
          )}
        </>
      );
      break;
    case 'progress':
      element = (
        <>
          {isEditable ? (
            <>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 1, minWidth: 120 }}>
                <Slider
                  value={value}
                  min={0}
                  max={100}
                  step={1}
                  onBlur={onBlurUpdate}
                  onChange={(event: Event, newValue: number | number[]) => {
                    setValue(newValue);
                  }}
                  valueLabelDisplay="auto"
                  aria-labelledby="non-linear-slider"
                />
              </Stack>
            </>
          ) : (
            <div>
              <LinearWithLabel value={value} sx={{ minWidth: 75 }} />
            </div>
          )}
        </>
      );
      break;
    default:
      element = <span></span>;
      break;
  }

  return element;
}
