KHULNSOFT_PATH="$SCRIPT_DIR/../lib/interface/cli/khulnasoft"

echo "Using $KHULNSOFT_PATH"
function khulnasoft() {
    $KHULNSOFT_PATH $@
}

function exists() {
    khulnasoft get $1 | grep $2 || echo ''
}
