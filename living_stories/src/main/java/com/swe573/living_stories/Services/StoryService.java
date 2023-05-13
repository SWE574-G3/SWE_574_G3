package com.swe573.living_stories.Services;

import com.swe573.living_stories.Confrugation.DateParser;
import com.swe573.living_stories.Confrugation.SearchQueryProvider;
import com.swe573.living_stories.DTO.MediaDTO;
import com.swe573.living_stories.Models.*;
import com.swe573.living_stories.Repositories.StoryRepository;
import com.swe573.living_stories.Repositories.UserRepository;
import com.swe573.living_stories.Requests.SearchRequest;
import com.swe573.living_stories.Requests.StoryRequest;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StoryService {

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SearchQueryProvider searchQueryProvider;




    @Autowired
    private DateParser dateParser;

    public Story createStory(Story story) {
        return storyRepository.save(story);
    }



    public Story updateStory(Long id, StoryRequest secondStory) {
        Story oldStory = storyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Story not found with id: " + id));


        if (secondStory.getRichText() != null) {
            oldStory.setRichText(secondStory.getRichText());
        }
        if (secondStory.getHeader() != null) {
            oldStory.setHeader(secondStory.getHeader());
        }
        if (secondStory.getLabels() != null) {
            oldStory.setLabels(secondStory.getLabels());
        }




        return storyRepository.save(oldStory);
    }

    public List<Story> getAllStories() {
        return storyRepository.findAll();
    }

    public Story getStoryById(Long id) {
        Optional<Story> story = storyRepository.findById(id);
        if (story.isPresent()){
            return story.get();
        }
        return null;
    }

    public List<Story> getByUserId(Long userId) {
        return storyRepository.findByUserId(userId);
    }


    public void deleteStoryById(Long storyId){
        Optional<Story> optionalStory = storyRepository.findById(storyId);
        if (optionalStory.isPresent()) {
            storyRepository.deleteById(storyId);
        }

    }



    public List<Story> getFollowingStories(Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        List<Story> result = new ArrayList<>();
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            List<Long> followingIds = user.getFollowing().stream().map(User::getId).collect(Collectors.toList());
            result = storyRepository.findByUserIdIn(followingIds);
        }
        return result;
    }



    public String likeStory(Long storyId , Long userId){
        Optional<User> optionalUser = userRepository.findById(userId);
        Optional<Story> optionalComment = storyRepository.findById(storyId);
        if (optionalComment.isPresent()&& optionalUser.isPresent()){
            Story story = optionalComment.get();
            ArrayList<Long> likes  = story.getLikes();
            if(!likes.contains(userId)){

                likes.add(userId);
                story.setLikes(likes);
                storyRepository.save(story);
                return "User liked story!";
            } else if (likes.contains(userId)) {
                likes.remove(userId);
                story.setLikes(likes);
                storyRepository.save(story);
                return "User unliked story";


            }

        }

        return "User or comment can not be found!";

    }
    public boolean addLocation(Long storyId, List<Locations> locationsList){
        Optional<Story> optionalStory = storyRepository.findById(storyId);
        if (optionalStory.isPresent()){
            Story story  = optionalStory.get();
            for (Locations location:locationsList) {
                location.setStory(story);
            }
            story.setLocations(locationsList);
            storyRepository.save(story);
            return true;

        }
        return false;
    }
    public boolean addMedia(Long storyId, ArrayList<MediaDTO> media){
        Optional<Story> optionalStory = storyRepository.findById(storyId);
        if (optionalStory.isPresent()){

            ArrayList<Media> mediaArrayList = new ArrayList<>();
            Story story = optionalStory.get();
            for (MediaDTO datas: media) {

                Media media_db = new Media();
                byte[] decodedBytes = Base64.getDecoder().decode(datas.getData());
                media_db.setStory(story);
                media_db.setData(decodedBytes);
                media_db.setType(datas.getType());
                mediaArrayList.add(media_db);
                System.out.println(media_db.toString());

            }
            story.setMedia(mediaArrayList);

            storyRepository.save(story);
        }

        return false;
    }


    public void addStartDate(Long storyId , String startDate) {
        Optional<Story> optionalStory  = storyRepository.findById(storyId);
        if (optionalStory.isPresent()){
            Story story  = optionalStory.get();
            Date date = DateParser.parseDate(startDate);
            story.setStartDate(date);
            storyRepository.save(story);

        }
    }

    public void addEndDate(Long storyId , String endDate) {
        Optional<Story> optionalStory = storyRepository.findById(storyId);
        if (optionalStory.isPresent()){
            Story story  = optionalStory.get();
            Date date = DateParser.parseDate(endDate);
            story.setEndDate(date);
            storyRepository.save(story);

        }
    }

    public void addSeason(Long storyId , String season){
        Optional<Story> optionalStory = storyRepository.findById(storyId);
        if (optionalStory.isPresent()){
            Story story  = optionalStory.get();
            story.setSeason(season);
            storyRepository.save(story);
        }
    }



    public List<Story> newsearch(SearchRequest searchRequest){


        List<Story> stories = storyRepository.search(searchRequest.getHeader() , searchRequest.getName(), searchRequest.getCity(), searchRequest.getCountry());
        List<Story> result  = new ArrayList<>();

        if (searchRequest.getStartDate() != null&& searchRequest.getEndDate()==null) {
            Date startDate = DateParser.parseDate(searchRequest.getStartDate());
            for (Story story: stories) {
                if (story.getStartDate()!=null && story.getStartDate().after(startDate)){
                    result.add(story);
                }
            }
        }if (searchRequest.getEndDate() != null) {
            Date endDate = DateParser.parseDate(searchRequest.getEndDate());
            Date startDate = DateParser.parseDate(searchRequest.getStartDate());
            for (Story story: stories) {
                if (story.getEndDate()!=null && story.getEndDate().before(endDate) &&story.getStartDate()!=null && story.getStartDate().after(startDate) ){
                    result.add(story);
                }
            }
        }
        if (searchRequest.getStartDate()==null && searchRequest.getEndDate() == null){
            return stories;
        }



        return  result;
    }

}
