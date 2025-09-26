if [ ! -f .env ]; then
    set -a
    source .env
    set
fi

#git related
export GITHUB_SHA=$(git rev-parse --short HEAD)
export GITHUB_BRANCH=$(git rev-parse --abbrev-ref HEAD)