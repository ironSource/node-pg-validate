#include "pgstrcasecmp.c"
#include "common.c"
#include "dt_common.c"
#include "interval.c"

bool isValidInterval(char *str) {
  interval   *result;
  result = (interval *) PGTYPESinterval_from_asc(str, NULL);
  
  if (!result) return false;

  free(result);
  return true;
}
