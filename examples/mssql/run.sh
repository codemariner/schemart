#!/bin/sh
../../bin/run \
	-f ./schemart.yaml \
	-u 'Server=localhost,1433;Database=master;User Id=SA;Password=SA_Pass!234;Encrypt=false'
