project='project-crud'

existing_project=`exists project $project`

if [ -z "$existing_project" ]; then
  echo "Project does not exist: $project"
  echo "Creating project: $project"
  khulnasoft create project $project
else
  echo "Project already exists: $project"
  khulnasoft delete project $project
  khulnasoft create project $project
fi

khulnasoft get projects
khulnasoft get project $project
khulnasoft delete project $project
