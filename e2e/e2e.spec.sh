# fail if one of the commands returns non-zero code
set -e
set -o pipefail

export SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
source "$SCRIPT_DIR/helpers.sh"

khulnasoft version
echo

for executable in $SCRIPT_DIR/scenarios/*.sh
do
  source $executable > "$executable.log" 2>&1 &
  echo "[$!] Executing: $executable"
done
echo

for job in `jobs -p`
do
    echo "Waiting for $job..."
    wait $job || exit 1
done

echo
echo "All tests executed successfully!"
